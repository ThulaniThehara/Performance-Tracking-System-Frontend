import { FaArrowAltCircleLeft,FaArrowAltCircleRight } from "react-icons/fa";
import TaskBar from "../../Components/SerachAnd/SearchAndButton";
import "../../SCSS/AdminStyles/AdminCommitees/Manage Committees.scss"
import Header from "../../Components/Header/Header";
import LeftNavigationBar from "../../Components/LeftNavigationBar/LeftNavigationBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProjectAddForm from "../../Components/AdminComponents/ProjectAddForm";
import ProjectsTable from "../../Components/AdminComponents/ProjectsTable";
import AddCommitteeForm from "../../Components/chair Component/AddCommitteeForm";
import ViewCommittees from "../../Components/chair Component/ViewCommitees";


const ManageCommittees = () => {
    const navigate = useNavigate()

    const [activeView, setActiveView] = useState('add');
      
        const handleViewChange = (view) => {
          setActiveView(view);
        };
      
          const handleCommitteeAdded = () => {
          setActiveView('view');
        };
    
    return (
        <div className='admin-commitees-container'>
            <Header/>
            <LeftNavigationBar/>
            <div className="taskbar-wrapper">
              <TaskBar
            title1="Add New Committees"
            title2="Search Committee"
            onAddClick={() => handleViewChange('add')}
            onViewClick={() => handleViewChange('view')}
            activeView={activeView}
            />
            </div>
            <div className='content-wrapper'>
            {activeView === 'add' && <AddCommitteeForm onCommitteeAdded={handleCommitteeAdded} />}
            {activeView === 'view' && <ViewCommittees />}
            </div>
       </div>
    );
}

export default ManageCommittees;