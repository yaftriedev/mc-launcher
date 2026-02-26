import { useEffect, useState } from 'react';
import React from 'react';

export default function ProgressBar() {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.api) return;

    window.api.onProgress((value) => {
      const val = value ?? 0;
      setVisible(true);
      setPercent(val);

      if (val >= 100) {
        setTimeout(() => {
          setVisible(false);
          setPercent(0);
        }, 1500); // 1.5s
      }
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="position-fixed" style={{ bottom: '20px', left: '20px', width: '300px', height: '25px' }}>
      <div className="progress shadow" style={{ height: '100%' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-dark"
          role="progressbar"
          style={{ width: `${percent}%` }}
          aria-valuenow={percent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}