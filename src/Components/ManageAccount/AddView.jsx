import React from 'react'
import { Link } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa';

function AddView() {
  return (
    <div>
        <div className="col"> 
          <Link to="">Add Member Account</Link>
        </div>
        <div className="col">
          <FaSearch/>
          <Link to="">View Account</Link>           
        </div>
    </div>
  )
}

export default AddView
