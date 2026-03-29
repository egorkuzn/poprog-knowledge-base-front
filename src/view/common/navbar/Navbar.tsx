import IAIELogo from '../../../images/iaie-icon.png'
import {Component, type ReactElement} from "react"
import {NavbarElement} from "./NavbarElement";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import type { NavbarState } from "../../../model/navbar/NavbarState";

/**
 * Шапка навигации
 */
export class Navbar extends Component<any, NavbarState> {
    location(): string {
        return window.location.pathname
    }

    state: NavbarState = {
        active: this.location(),
        pressed: this.location(),
        entered: ""
    }

    render(): ReactElement {
        console.log(this.state.active)
        return (
            <nav>
                <a href="https://www.iae.nsk.su/ru/"> <img src={IAIELogo} alt="IAIE logo"/></a>
                <div className="nav-elem-box">
                    {NavigationTree.map ((entry) => <NavbarElement path={entry[0]}
                                                  title={entry[1]}
                                                  navbarStateValue={this.state}
                                                  onChange={(newSate) => {
                                                      newSate.active = this.location()
                                                      this.setState(newSate)
                                                  }}/>
                                                )
                
                                }
                </div>
            </nav>
        )
    }
}

