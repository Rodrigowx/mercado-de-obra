import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";


interface PortfolioCardProps {
  name: string;
  description: string;
  profileLink: string;
  images?: string[];
  rating?: number;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  name,
  description,
  profileLink,
  images = [],
  rating = 0,
}) => {
  return (
    <div className="bg-gray-100 w-[18rem] container mx-auto dark:bg-gray-800 shadow-lg rounded-lg h-max-auto">
      {/* Swiper para exibir imagens */}
      {images.length > 0 ? (
        <Swiper
          spaceBetween={1}
          slidesPerView={1}
          className="rounded-lg overflow-hidden"
          navigation // Habilita botões de navegação
          pagination={{ clickable: true }} // Habilita bolinhas de paginação
          modules={[Navigation, Pagination]} // Adiciona os módulos de navegação e paginação
        >
          {images.map((imageUrl, index) => (
            <SwiperSlide key={`image-${index}`}>
              <Image
                src={imageUrl}
                alt={`Imagem do portfólio de ${name}`}
                width={640}
                height={360}
                quality={75}
                className="w-full h-[16rem] object-cover transition-transform duration-300 transform hover:scale-105"
                priority 
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-[16rem] bg-gray-200 animate-pulse rounded-md"></div>
      )}

      <div className="px-2 flex flex-col mt-3 justify-between">
        <div className="flex flex-row items-baseline justify-between">
          {/* Nome e link do perfil */}
          <h3 className="lg:text-base md:text-sm sm:text-xs font-bold line-clamp-1 scrollbar hover:overflow-y-auto text-gray-800 dark:text-gray-200">
            {name}
          </h3>
          {/* Avaliação com estrelas */}
          <div className="flex items-center ml-1">
            <FaStar className="text-primary" />
            <span className="text-sm ml-1">
              {Number.isNaN(Number(rating)) ? "0.0" : Number(rating).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="min-h-10 mt-1">
          <h4 className="text-sm text-gray-800 h-auto line-clamp-2 scrollbar hover:overflow-y-auto dark:text-gray-200">
            {description}
          </h4>
        </div>
        <div className="content-end mt-2">
          <p className=" pb-2 lg:text-base md:text-sm sm:text-xss text-gray-600 dark:text-gray-400">
            <Link
              href={profileLink}
              className="text-primary underline-offset-2 hover:underline"
            >
              Ver Perfil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
