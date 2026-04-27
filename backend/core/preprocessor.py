import cv2
import numpy as np
import os

def preprocess_image(filepath, techniques=None):
    if not os.path.exists(filepath):
        raise ValueError(f"File not found at: {filepath}")

    if techniques is None:
        techniques = ['resizing', 'grayscale']

    if filepath.lower().endswith('.pdf'):
        import fitz
        doc = fitz.open(filepath)
        page = doc.load_page(0)
        pix = page.get_pixmap()
        img_data = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        image = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR) if pix.n >= 3 else img_data
    elif filepath.lower().endswith(('.docx', '.doc')):
        try:
            import docx
            from PIL import Image, ImageDraw
            import textwrap
            doc = docx.Document(filepath)
            extracted = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            
            img = Image.new('RGB', (800, 1200), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            
            wrapped_text = "\n".join(textwrap.wrap(extracted, width=110))
            draw.text((30, 30), wrapped_text[:5000], fill=(0, 0, 0)) 
            
            image_raw = np.array(img)
            image = cv2.cvtColor(image_raw, cv2.COLOR_RGB2BGR)
        except Exception as e:
            image = np.ones((1200, 800, 3), dtype=np.uint8) * 255
    else:
        image = cv2.imread(filepath)

    if image is None:
        raise ValueError("Invalid image or corrupted file.")

    processed_data = {'original': image.copy()}
    curr_image = image

    if 'resizing' in techniques:
        curr_image = cv2.resize(curr_image, (800, 1000), interpolation=cv2.INTER_CUBIC)
        processed_data['resizing'] = curr_image.copy()

    if 'grayscale' in techniques:
        curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2GRAY)
        processed_data['grayscale'] = curr_image.copy()
    
    if 'hsv' in techniques:
        if len(curr_image.shape) == 2: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_GRAY2BGR)
        curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2HSV)
        processed_data['hsv'] = curr_image.copy()

    if 'lab' in techniques:
        if len(curr_image.shape) == 2: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_GRAY2BGR)
        curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2LAB)
        processed_data['lab'] = curr_image.copy()

    if 'equalization' in techniques:
        if len(curr_image.shape) == 3:
            yuv = cv2.cvtColor(curr_image, cv2.COLOR_BGR2YUV)
            yuv[:,:,0] = cv2.equalizeHist(yuv[:,:,0])
            curr_image = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
        else:
            curr_image = cv2.equalizeHist(curr_image)
        processed_data['equalization'] = curr_image.copy()

    if 'clahe' in techniques:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        if len(curr_image.shape) == 3:
            lab = cv2.cvtColor(curr_image, cv2.COLOR_BGR2LAB)
            lab[:,:,0] = clahe.apply(lab[:,:,0])
            curr_image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        else:
            curr_image = clahe.apply(curr_image)
        processed_data['clahe'] = curr_image.copy()

    if 'gaussian_blur' in techniques:
        curr_image = cv2.GaussianBlur(curr_image, (5, 5), 0)
        processed_data['gaussian_blur'] = curr_image.copy()

    if 'median_blur' in techniques:
        curr_image = cv2.medianBlur(curr_image, 5)
        processed_data['median_blur'] = curr_image.copy()

    if 'bilateral_filter' in techniques:
        curr_image = cv2.bilateralFilter(curr_image, 9, 75, 75)
        processed_data['bilateral_filter'] = curr_image.copy()

    if 'sharpening' in techniques:
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        curr_image = cv2.filter2D(curr_image, -1, kernel)
        processed_data['sharpening'] = curr_image.copy()

    if 'thresholding' in techniques:
        if len(curr_image.shape) == 3: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2GRAY)
        _, curr_image = cv2.threshold(curr_image, 127, 255, cv2.THRESH_BINARY)
        processed_data['thresholding'] = curr_image.copy()

    if 'otsu' in techniques:
        if len(curr_image.shape) == 3: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2GRAY)
        _, curr_image = cv2.threshold(curr_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        processed_data['otsu'] = curr_image.copy()

    if 'adaptive_thresholding' in techniques:
        if len(curr_image.shape) == 3: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2GRAY)
        curr_image = cv2.adaptiveThreshold(curr_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        processed_data['adaptive_thresholding'] = curr_image.copy()

    kernel = np.ones((5,5), np.uint8)
    if 'erosion' in techniques:
        curr_image = cv2.erode(curr_image, kernel, iterations=1)
        processed_data['erosion'] = curr_image.copy()

    if 'dilation' in techniques:
        curr_image = cv2.dilate(curr_image, kernel, iterations=1)
        processed_data['dilation'] = curr_image.copy()

    if 'opening' in techniques:
        curr_image = cv2.morphologyEx(curr_image, cv2.MORPH_OPEN, kernel)
        processed_data['opening'] = curr_image.copy()

    if 'closing' in techniques:
        curr_image = cv2.morphologyEx(curr_image, cv2.MORPH_CLOSE, kernel)
        processed_data['closing'] = curr_image.copy()

    if 'edge_detection' in techniques:
        if len(curr_image.shape) == 3: curr_image = cv2.cvtColor(curr_image, cv2.COLOR_BGR2GRAY)
        curr_image = cv2.Canny(curr_image, 30, 100)
        processed_data['edge_detection'] = curr_image.copy()

    if 'rotation' in techniques:
        (h, w) = curr_image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, 45, 1.0)
        curr_image = cv2.warpAffine(curr_image, M, (w, h))
        processed_data['rotation'] = curr_image.copy()

    if 'normalization' in techniques:
        temp_img = curr_image.astype(np.float32)
        curr_image = cv2.normalize(temp_img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        processed_data['normalization'] = curr_image.copy()

    if 'padding' in techniques:
        curr_image = cv2.copyMakeBorder(curr_image, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=[0,0,0])
        processed_data['padding'] = curr_image.copy()

    processed_data['final'] = curr_image
    if 'gray' not in processed_data:
        processed_data['gray'] = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    return processed_data
