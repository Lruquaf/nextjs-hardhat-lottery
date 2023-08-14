import { ConnectButton } from "@web3uikit/web3";

export default function Header() {
    return (
        <div className="p-5 border-4 rounded border-blue-900 flex flex-row bg-sky-300">
            <h1 className="py-4 px-4 font-bold text-3xl">Decentralized Automated Lottery</h1>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    );
}
