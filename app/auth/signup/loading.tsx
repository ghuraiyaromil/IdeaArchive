export default function SignupLoading() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="h-8 w-40 mx-auto bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="flex flex-col gap-3">
          <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
