import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {Breadcrumbs} from "../view/common/navigation/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders current page and previous links", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Публикации"}]} />
      </MemoryRouter>
    );

    expect(screen.getByRole("navigation", {name: "Хлебные крошки"})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "Главная"})).toHaveAttribute("href", "/home");
    expect(screen.getByText("Публикации")).toHaveAttribute("aria-current", "page");
  });

  it("returns null when items are empty", () => {
    const {container} = render(
      <MemoryRouter>
        <Breadcrumbs items={[]} />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
