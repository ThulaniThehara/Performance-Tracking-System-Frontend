import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../../SCSS/AdminStyles/AdminProjectStyles/ProjectAddForm.scss'

const ProjectAddForm = ({ onProjectAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    department: 'General',
    chairPerson: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.projectName || !formData.description || !formData.startDate || !formData.endDate) {
      alert(t('projectAddForm.fillRequired'))
      return
    }
    
    if (onProjectAdded) {
      onProjectAdded(formData)
    }
    
    // Reset form
    setFormData({
      projectName: '',
      description: '',
      startDate: '',
      endDate: '',
      department: 'General',
      chairPerson: ''
    })
  }

  return (
    <div className='project-form-container'>
      <div className='form-card'>
        <div className='form-header'>
          <h2>{t('projectAddForm.heading')}</h2>
          <p>{t('projectAddForm.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className='modern-form'>
          <div className='form-group'>
            <label htmlFor="projectName" className='form-label'>
              {t('projectAddForm.nameLabel')}
              <span className='required'>*</span>
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              className='form-input'
              placeholder={t('projectAddForm.namePlaceholder')}
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="description" className='form-label'>
              {t('projectAddForm.descriptionLabel')}
              <span className='required'>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className='form-textarea'
              placeholder={t('projectAddForm.descriptionPlaceholder')}
              rows='4'
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor="startDate" className='form-label'>
                {t('projectAddForm.startDateLabel')}
                <span className='required'>*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className='form-input'
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor="endDate" className='form-label'>
                {t('projectAddForm.endDateLabel')}
                <span className='required'>*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className='form-input'
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor="department" className='form-label'>
                {t('projectAddForm.departmentLabel')}
              </label>
              <select
                id="department"
                name="department"
                className='form-input'
                value={formData.department}
                onChange={handleChange}
              >
                <option value="General">{t('projectAddForm.departments.general')}</option>
                <option value="Engineering">{t('projectAddForm.departments.engineering')}</option>
                <option value="Science">{t('projectAddForm.departments.science')}</option>
                <option value="Arts">{t('projectAddForm.departments.arts')}</option>
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor="chairPerson" className='form-label'>
                {t('projectAddForm.chairPersonLabel')}
              </label>
              <input
                type="text"
                id="chairPerson"
                name="chairPerson"
                className='form-input'
                placeholder={t('projectAddForm.chairPersonPlaceholder')}
                value={formData.chairPerson}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='form-actions'>
            <button type='submit' className='btn-primary'>
              {t('admin.projects.createProject')}
            </button>
            <button type='reset' className='btn-secondary'>
              {t('projectAddForm.clear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectAddForm
