import React, { useState } from 'react'
import Header from '../../Components/Header/Header'
import TaskBar from '../../Components/SerachAnd/SearchAndButton'
import LeftNavChair from '../../Components/chair Component/LeftNavChair'
import AddTask from '../../Components/chair Component/AddTask'
import ViewTasks from '../../Components/chair Component/ViewTask'
    

const ManageTask = () => {
   const [activeView, setActiveView] = useState('add');

   const handleViewChange = (view) => {
    setActiveView(view);
 };

  return (
    <>
    <Header/>
    <TaskBar title1="Add Tasks" title2="View Tasks"
     onAddClick={() => handleViewChange('add')}
        onViewClick={() => handleViewChange('view')}
        activeView={activeView}
    />

    {activeView === 'add' && <AddTask/>}
    {activeView === 'view' && <ViewTasks/>
   }
  
    <LeftNavChair/>
     
    </>
  )
}

export default ManageTask