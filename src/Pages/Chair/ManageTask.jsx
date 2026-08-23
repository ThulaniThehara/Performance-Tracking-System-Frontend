import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../Components/Header/Header'
import TaskBar from '../../Components/SerachAnd/SearchAndButton'
import LeftNavChair from '../../Components/chair Component/LeftNavChair'
import AddTask from '../../Components/chair Component/AddTask'
import ViewTasks from '../../Components/chair Component/ViewTask'
    

const ManageTask = () => {
   const { t } = useTranslation();
   const [activeView, setActiveView] = useState('add');

   const handleViewChange = (view) => {
    setActiveView(view);
 };

  return (
    <>
    <Header/>
    <TaskBar title1={t('chair.manageTask.addTitle')} title2={t('chair.manageTask.viewTitle')}
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