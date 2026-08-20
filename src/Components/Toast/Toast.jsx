import React, { useState, useEffect } from 'react'
import './Toast.scss'

const Toast = ({ message, isVisible, duration = 2000 }) => {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration])

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  )
}

export default Toast
