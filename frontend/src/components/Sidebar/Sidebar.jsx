import "./Sidebar.css";

function Sidebar({ projects, position }) {
  return (
    <aside className={`side ${position}`}>
      {projects.map((project, i) => (
        <div key={i} className="project-card">
          <img src={project.image} alt={project.title} />
          <h4>{project.title}</h4>
          <p>{project.date}</p>
          {project.featured && <span>⭐ Featured</span>}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
