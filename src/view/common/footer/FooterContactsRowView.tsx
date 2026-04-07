import {Component} from "react";
import {requestExternalNavigation} from "../../../utils/externalNavigation";

export class FooterContactsRowView extends Component<any> {
    render() {
        return (<div>
            <ul style={{paddingLeft: 0, marginLeft: 0, listStyle: 'none'}}>
            <ContactElementView resourceName="Почта" text="poprog@iae.nsk.su" path=""/>
            <ContactElementView resourceName="Телеграмм" text="@poprog" path="https://t.me/poprog"/>
            <ContactElementView resourceName="Реддит" text="r/poprog" path="https://reddit.com/r/poprog/"/>
            </ul>
            <p>О нас</p>
            <p>Карьера</p>
            <p>© 2025 poprog</p>
        </div>);
    }
}

interface ContactElementProp {
    resourceName: string;
    path: string;
    text: string;
}

class ContactElementView extends Component<ContactElementProp> {
    render() {
        let phrase = this.props.resourceName + ": " + this.props.text

        if (this.props.path === "") {
            return <li>{phrase}</li>
        } else {
            return (
                <li>
                    <a
                        href={this.props.path}
                        onClick={(event) => {
                            event.preventDefault();
                            void requestExternalNavigation(this.props.path);
                        }}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {phrase}
                    </a>
                </li>
            );
        }
    }
}
