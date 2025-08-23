import ChatComponent from "@/components/ChatComponent";
import FileDropper from "@/components/FileDropper";
import { ModeToggle } from "@/components/ModeToggle";
import UrlParser from "@/components/UrlParser";

export default function Home() {
	return (
		<div className="relative grid grid-cols-12 gap-4 w-screen h-screen">
			<div className="col-span-3 w-full  max-w-4xl mx-auto items-center justify-center border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 flex-col gap-10">
				<UrlParser />
				<p className="text-center mt-5"></p>
				<FileDropper />
			</div>
			<div className="col-span-9">
				<ChatComponent />
			</div>

			<div className="absolute top-4 right-4 rounded-full z-10">
				<ModeToggle />
			</div>
		</div>
	);
}
