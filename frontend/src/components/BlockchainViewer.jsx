import React, { useState, useEffect } from 'react';
import { Database, Loader2, Search, ArrowRight, ShieldCheck, Clock, Eye } from 'lucide-react';
import './BlockchainViewer.css';

const BlockchainViewer = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [fetchingHash, setFetchingHash] = useState(null);
  const [ipfsCache, setIpfsCache] = useState({});

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchIpfsContent = async (hash) => {
    if (ipfsCache[hash]) return;
    setFetchingHash(hash);
    try {
      const response = await fetch(`http://localhost:5000/api/ipfs/${hash}`);
      const data = await response.json();
      if (data.status === 'success') {
        setIpfsCache(prev => ({...prev, [hash]: data.data}));
      } else {
        setIpfsCache(prev => ({...prev, [hash]: "Failed to retrieve"}));
      }
    } catch (e) {
      setIpfsCache(prev => ({...prev, [hash]: "Connection error"}));
    } finally {
      setFetchingHash(null);
    }
  };

  const fetchBlockchainData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/blockchain');
      const data = await response.json();
      if (data.status === 'success') {
        setBlocks(data.data.reverse()); // Show newest first
        setIsValid(data.is_valid);
      } else {
        throw new Error(data.message || 'Failed to fetch blockchain data');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="blockchain-loading fade-in-up">
        <Loader2 className="animate-spin" size={48} />
        <p>Syncing with Blockchain Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-error glass-panel fade-in-up">
        <Database size={48} color="var(--danger)" />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchBlockchainData}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="blockchain-viewer fade-in-up">
      <div className="blockchain-header">
        <div className="header-title">
          <Database size={32} color="var(--primary)" />
          <h2>Decentralized Ledger</h2>
        </div>
        <div className={`chain-status ${isValid ? 'valid' : 'invalid'}`}>
          <ShieldCheck size={20} />
          <span>Chain Integrity: {isValid ? 'SECURE' : 'COMPROMISED'}</span>
        </div>
      </div>

      <div className="blocks-container">
        {blocks.map((block) => (
          <div key={block.index} className="block-card glass-panel">
            <div className="block-index">
              <span>Block #{block.index}</span>
            </div>
            
            <div className="block-content">
              <div className="data-row">
                <span className="label">Timestamp:</span>
                <span className="value flex-center">
                  <Clock size={16} style={{marginRight: '6px'}}/>
                  {formatDate(block.timestamp)}
                </span>
              </div>
              
              <div className="data-row">
                <span className="label">Data Payload:</span>
                <div className="payload-box">
                  {typeof block.data === 'string' ? (
                    block.data
                  ) : (
                    <div className="payload-json">
                      <div><span style={{color: 'var(--text-muted)'}}>File: </span> <span style={{color: 'var(--primary)'}}>{block.data.file}</span></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Status: </span> 
                        <span style={{color: block.data.status ? 'var(--accent)' : 'var(--danger)'}}>
                          {block.data.status ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      {block.data.ipfs_hash && (
                        <div className="extracted-text-preview" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                          <div style={{color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <span>IPFS Hash:</span>
                            {!ipfsCache[block.data.ipfs_hash] && (
                              <button 
                                className="btn btn-ghost" 
                                style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: 'auto'}}
                                onClick={() => fetchIpfsContent(block.data.ipfs_hash)}
                                disabled={fetchingHash === block.data.ipfs_hash}
                              >
                                {fetchingHash === block.data.ipfs_hash ? <Loader2 className="animate-spin" size={14}/> : 'Fetch'}
                              </button>
                            )}
                          </div>
                          <code style={{ fontSize: '0.85rem', color: 'var(--secondary)', wordBreak: 'break-all' }}>
                            {block.data.ipfs_hash}
                          </code>
                          {ipfsCache[block.data.ipfs_hash] && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem'}}>Stored Content:</span>
                              <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', color: 'white', fontStyle: 'italic' }}>
                                "{ipfsCache[block.data.ipfs_hash]}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="hash-row">
                <span className="label">Hash:</span>
                <span className="hash value hash-text">{block.hash}</span>
              </div>
              
              {block.previous_hash !== "0" && (
                <div className="hash-row prev-hash">
                  <span className="label">Prev Hash:</span>
                  <span className="hash value hash-text muted">{block.previous_hash}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
          <div className="empty-state">
            <Database size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
            <p>No blocks found in the chain.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainViewer;
