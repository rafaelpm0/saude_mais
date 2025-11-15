import { Link, useLocation } from "react-router-dom";

function BreadCrumb() {
  const location = useLocation();

  // Divide a rota atual em partes
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="breadcrumbs text-sm bg-base-200 p-4">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <li key={to}>{value}</li>
          ) : (
            <li key={to}>
              <Link to={to}>{value}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BreadCrumb;