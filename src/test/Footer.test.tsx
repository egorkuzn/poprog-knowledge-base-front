import {fireEvent, render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {Footer} from "../view/common/footer/Footer";

vi.mock("../hooks/useRemoteData", () => ({
  useRemoteData: vi
    .fn()
    .mockReturnValueOnce({data: [{title: "Работы 2025", hash: "works-2025"}]})
    .mockReturnValue({data: [{date: "2025", hash: "2025"}]})
}));

vi.mock("../api/knowledgeBaseApi", () => ({
  getGroupedPublications: vi.fn(),
  getGroupedStudentWorks: vi.fn()
}));

vi.mock("../utils/externalNavigation", () => ({
  requestExternalNavigation: vi.fn()
}));

describe("Footer", () => {
  it("renders key footer links", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", {name: "Мой аккаунт"})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "Публикации"})).toHaveAttribute("href", "/publications");
    expect(screen.getByRole("link", {name: "Поддержка"})).toHaveAttribute("href", "/support");
  });

  it("opens search from footer and scrolls to top", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Footer />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", {name: /Поиск/i}));

    expect(scrollToSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    scrollToSpy.mockRestore();
    dispatchSpy.mockRestore();
  });
});
