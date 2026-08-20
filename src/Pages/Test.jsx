import React from 'react'
import LeftNavigationBar from '../Components/LeftNavigationBar/LeftNavigationBar'
import Header from '../Components/Header/Header'
import AddView from '../Components/ManageAccount/AddView'
import BasicInfo from '../Components/ManageAccount/BasicInfo'

function Test() {
  return (
    <div>
        <Header/>
        <AddView/>
        <LeftNavigationBar/>
        {/* <BasicInfo/> */}
          
    </div>
  )
}

export default Test