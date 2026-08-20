import React from 'react'
import SettingComponent from '../Components/SettingsComponent/SettingComponent'
import '../SCSS/componentStyle/Settings.scss'
import Header from '../Components/Header/Header'
import LeftNavigationBar from '../Components/LeftNavigationBar/LeftNavigationBar'

const Settings = () => {
  return (
    <div>
        <Header/>
        <LeftNavigationBar/>
      <SettingComponent />
    </div>
  )
}

export default Settings
