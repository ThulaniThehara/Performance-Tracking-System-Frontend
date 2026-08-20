import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import '../../SCSS/ChairStyle/TaskBar.scss'

const TaskBar = ({title1, title2, onAddClick, onViewClick, activeView}) => {
    const [Add, setState1] = React.useState(activeView === 'add');
    const [View, setState2] = React.useState(activeView === 'view');

    React.useEffect(() => {
        setState1(activeView === 'add');
        setState2(activeView === 'view');
    }, [activeView]); 

    const click1 = () => {
        setState1(true);
        setState2(false);
        if (onAddClick) onAddClick();
    }
    
    const click2 = () => {
        setState2(true);
        setState1(false);
        if (onViewClick) onViewClick();
    }

    return (
        <div className={`TaskBar${Add === true || View === true ? " purple" : ""}`}>
            <div className={`add ${Add ? 'active' : ''}`} onClick={click1}>
                <FaPlus/>
                <h3 className={Add ? 'white' : ''}>{title1}</h3>
            </div>
            <div className={`view ${View ? 'active' : ''}`} onClick={click2}>
                <FaSearch/>
                <h3 className={View ? 'white' : ''}>{title2}</h3>
            </div>
        </div>
    )
}

export default TaskBar