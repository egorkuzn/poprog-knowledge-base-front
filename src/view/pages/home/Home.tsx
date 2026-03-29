import BodyView from "../BodyView";
import '../../../styles/pages/Home.scss';
import RotatingText from './components/RotatingText';

export function Home() {
    return (
        BodyView(Page())
    )
}

function Page() {
    return (
        <main>
            <div className="content">
                <div className="home">
                    <RotatingText/>
                </div>
            </div>
        </main>
    )
}
