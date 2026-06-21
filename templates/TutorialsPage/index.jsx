"use client";

import Button from "@/components/Button";
import ErrorComp from "@/components/Error";
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import { useGetPublicTutorials } from "@/hooks/academy/useGetPublicTutorials";
import { useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import { decoratePublicTutorial } from "./_lib";

const TutorialsPage = () => {
  const [active, setActive] = useState(null);

  const { data, isLoading, isError, isFetching, refetch } =
    useGetPublicTutorials();

  // The endpoint mirrors the authenticated one (`{ tutorials, featured,
  // categories }`); the public grid only needs the flat tutorials list. Stay
  // resilient if the backend returns a bare array instead.
  const videos = useMemo(() => {
    const list = Array.isArray(data) ? data : (data?.tutorials ?? []);
    return list.map(decoratePublicTutorial);
  }, [data]);

  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col pt-[160px] pb-[120px] max-md:pt-[120px] max-md:pb-[80px]"
    >
      <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-[70px] max-xl:px-8 max-md:gap-[48px] max-md:px-4">
        {/* Header */}
        <div className="flex w-full flex-col items-center justify-center gap-7 max-md:gap-5">
          <span className="flex items-center justify-center rounded-[32px] border-[0.7px] border-[rgba(25,54,63,0.04)] bg-[rgba(25,54,63,0.02)] px-3.5 py-2.5 font-inter text-[12px] font-medium tracking-[-0.48px] text-[rgba(25,54,63,0.7)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
            Centro de aprendizaje
          </span>
          <h1 className="max-w-[781px] text-center font-inter text-[54px] font-medium leading-[1.05] tracking-[-2.16px] text-[#19363f] max-md:text-[32px] max-md:tracking-[-1.28px]">
            Aprende el mundo cripto, de cero a experto.
          </h1>
          <p className="max-w-[475px] text-center font-inter text-[16px] font-normal leading-6 tracking-[-0.32px] text-[rgba(25,54,63,0.7)] max-md:text-[14px]">
            Aquí entenderás el mundo de las criptomonedas y la blockchain de
            forma fácil, interactiva y confiable.
          </p>
        </div>

        {/* Content states */}
        {isLoading ? (
          <div className="flex min-h-80 w-full items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="flex min-h-80 w-full flex-col items-center justify-center gap-5">
            <ErrorComp
              error
              message="No se pudieron cargar los tutoriales. Inténtalo de nuevo."
              className="max-w-sm"
            />
            <Button
              isSecondary
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Cargando…" : "Reintentar"}
            </Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex min-h-80 w-full flex-col items-center justify-center gap-2 text-center">
            <p className="font-inter text-[18px] font-medium tracking-[-0.72px] text-[#19363f]">
              Aún no hay tutoriales disponibles.
            </p>
            <p className="font-inter text-[14px] tracking-[-0.28px] text-[rgba(25,54,63,0.6)]">
              Estamos preparando nuevo contenido. Vuelve pronto.
            </p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-4 gap-x-4 gap-y-[60px] max-lg:grid-cols-2 max-md:gap-y-10 max-sm:grid-cols-1">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => setActive(video)}
              />
            ))}
          </div>
        )}
      </section>

      <VideoModal
        open={!!active}
        video={active}
        onClose={() => setActive(null)}
      />
    </Layout>
  );
};

export default TutorialsPage;
