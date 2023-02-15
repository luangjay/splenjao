export default function TailwindBugFix() {
  return (
    <>
      <div className="hidden bg-white"></div>
      <div className="hidden bg-red-500"></div>
      <div className="hidden bg-green-500"></div>
      <div className="hidden bg-blue-500"></div>
      <div className="hidden bg-gray-800"></div>
      <div className="hidden bg-yellow-300"></div>
      <div className="hidden bg-gray-100"></div>
      <div className="hidden bg-blue-600"></div>
      <div className="hidden bg-red-600"></div>
      <div className="hidden bg-green-600"></div>
      <div className="hidden bg-black"></div>
      <div className="hidden bg-yellow-400"></div>
      <svg className="fill-white hover:fill-gray-100"></svg>
      <svg className="fill-blue-500 hover:fill-blue-600"></svg>
      <svg className="fill-green-500 hover:fill-green-600"></svg>
      <svg className="fill-red-500 hover:fill-red-600"></svg>
      <svg className="fill-gray-800 hover:fill-black"></svg>
      <svg className="hover:fill-yellow-40 fill-yellow-300"></svg>
    </>
  );
}
