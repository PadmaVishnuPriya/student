import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-title">Faculty Menu</div>
      <button className={activePage === 'add' ? 'active' : ''} onClick={() => setActivePage('add')}>
        👥 Manage Students
      </button>
      <button className={activePage === 'marks' ? 'active' : ''} onClick={() => setActivePage('marks')}>
        📝 Add Metrics
      </button>
      <button className={activePage === 'trust' ? 'active' : ''} onClick={() => setActivePage('trust')}>
        ⭐ Trust Score Report
      </button>
    </div>
  );
};

export default Sidebar;
