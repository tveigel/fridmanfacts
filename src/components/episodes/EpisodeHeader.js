// src/components/episodes/EpisodeHeader.js
export default function EpisodeHeader({ thumbnail, title, guest, date, videoLink }) {
  return (
    <div className="mb-12">
      {/* Card container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Title and metadata */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Guest:</span>
                <span>{guest}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Image and watch button container */}
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Thumbnail in a reasonable size */}
            <div className="w-full sm:w-64 h-36 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={thumbnail}
                alt={`Thumbnail for ${title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Watch button */}
            <a
              href={videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 
                       text-white font-medium rounded-lg transition-colors duration-200
                       shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
