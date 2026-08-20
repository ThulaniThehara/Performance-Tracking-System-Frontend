import React from 'react'


function BasicInfo() {
return (
    <div>
        
        <div className="section">
            <h3>Basic Information</h3>
            <div className="form-row">
                <label>. Full Name</label>
                <input type="text"/>
            </div>
            <div className="form-row">
                <label>. Email Address</label>
                <input type="email"/>
            </div>
            <div className="form-row">
                <label>. Mobile/Phone Number</label>
                <input type="text"/>
            </div>
        </div>
        
        <div className="section">
            <h3>Personal Details</h3>
            <div className="form-row">
                <label>. Gender</label>
                <input type="text" />
            </div>
            <div className="form-row">
                <label>. Date of Birth</label>
                <input type="date"/>
            </div>
            <div className="form-row">
                <label>. Department / University Faculty</label>
                <input type="text"/>
            </div>
            <div className="form-row">
                <label>. Batch</label>
                <input type="text"/>
            </div>
        </div>
        <button className="create">Create Account</button>
    </div>
    
)
}

export default BasicInfo