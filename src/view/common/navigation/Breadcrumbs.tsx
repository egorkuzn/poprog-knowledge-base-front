import {Link} from "react-router-dom";
import "../../../styles/common/Breadcrumbs.scss";

export interface BreadcrumbItem {
    label: string
    to?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs(props: BreadcrumbsProps) {
    if (props.items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Хлебные крошки" className="site-breadcrumbs">
            {props.items.map((item, index) => {
                const isLast = index === props.items.length - 1;

                return (
                    <span className="site-breadcrumbs-item" key={`${item.label}-${index}`}>
                        {item.to && !isLast ? (
                            <Link to={item.to}>{item.label}</Link>
                        ) : (
                            <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                        )}
                        {!isLast && <span className="site-breadcrumbs-separator">/</span>}
                    </span>
                );
            })}
        </nav>
    );
}
