import React from 'react';
import { createRoot } from 'react-dom/client';

import Header from './Header.jsx';
import Launch from './Launch.jsx';

createRoot(document.getElementById('root')).render(<div><Header/><Launch/></div>);