import ChatComponent from "@/components/ChatComponent";
import FileDropper from "@/components/FileDropper";
import { ModeToggle } from "@/components/ModeToggle";
import UrlParser from "@/components/UrlParser";

export default function Home() {
  return (
    <div className="relative grid h-screen w-screen grid-cols-12 gap-4">
      <div className="col-span-3 hidden w-full max-w-4xl flex-col items-center justify-center gap-10 border border-dashed border-neutral-200 bg-white lg:flex dark:border-neutral-800 dark:bg-black">
        <UrlParser />
        <p className="mt-5 text-center"></p>
        <FileDropper />
      </div>

      <div className="col-span-12 lg:col-span-9">
        <ChatComponent />
      </div>

      {/* <div className="absolute bottom-5 left-5 z-10 hidden rounded-full lg:flex"> */}
      <div className="absolute bottom-5 left-14 z-10 hidden rounded-full lg:flex">
        <ModeToggle />
      </div>
    </div>
  );
}
