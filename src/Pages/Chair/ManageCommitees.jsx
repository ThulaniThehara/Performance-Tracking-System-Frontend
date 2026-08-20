import React, { useState } from 'react'
import Header from '../../Components/Header/Header'
import LeftNavChair from '../../Components/chair Component/LeftNavChair'
import SearchAndButton from '../../Components/SerachAnd/SearchAndButton'
import AddCommitteeForm from '../../Components/chair Component/AddCommitteeForm'
import ViewCommittees from '../../Components/chair Component/ViewCommitees'

const ManageCommitees = () => {
  const [activeView, setActiveView] = useState('add');

  const handleViewChange = (view) => {
    setActiveView(view);
  };

    const handleCommitteeAdded = () => {
    setActiveView('view');
  };

  return (
    <div className="manage-committees-page">
      <Header />
      <LeftNavChair />
      <SearchAndButton 
        title1="Add Committee" 
        title2="View Committees"
        onAddClick={() => handleViewChange('add')}
        onViewClick={() => handleViewChange('view')}
        activeView={activeView}
      /> 

      {activeView === 'add' && <AddCommitteeForm onCommitteeAdded={handleCommitteeAdded} />}
      {activeView === 'view' && <ViewCommittees />}
    </div>
  )
}

export default ManageCommitees