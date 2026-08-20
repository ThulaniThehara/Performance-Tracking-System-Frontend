import React from 'react'

const ChairProject = ({title,}) => {
  return (
    <div className="ProjectStructure">
        <h1>{title}</h1>
        <div classNmae="Pimage">
            <img src={img} alt={title} />
        </div>
        <p>{description}</p>
        <div className="cahirperson">
            <img src={img} alt={Chairimg} />
            <h3>{Cname}-{position}</h3>
        </div>
    </div>
  )
}

export default ChairProject