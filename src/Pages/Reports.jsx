import React from 'react'
import ReportsComponents from '../Components/ReportsComponent/ReportsComponents'
import Header from '../Components/Header/Header'
import LeftNavigationBar from '../Components/LeftNavigationBar/LeftNavigationBar'

const Reports = () => {
  return (
    <div>
        <Header/>
        <LeftNavigationBar />
      <ReportsComponents />
    </div>
  )
}

export default Reports
