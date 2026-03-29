import type {NavbarState} from "./NavbarState";

/**
 * Описываем принимаемые параметры компонента
 */
export interface NavbarElementProp {
    path: string,
    title: string,
    navbarStateValue: NavbarState,
    onChange: (newState: NavbarState) => void
}
