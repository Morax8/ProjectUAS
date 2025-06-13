const GifModal = ({ gifSrc }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <img src={gifSrc} alt="GIF" className="max-w-full max-h-full rounded-lg" />
    </div>
);
export default GifModal;
