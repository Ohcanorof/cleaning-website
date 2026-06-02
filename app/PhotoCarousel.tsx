"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Item = { src: string; alt: string };

const IMAGES: Item[] = [
  { src: "/gallery/clean3.png", alt: "Cleaning photo 1" },
  { src: "/gallery/dirty1.0.png", alt: "Cleaning photo 2" },
  { src: "/gallery/clean4.png", alt: "Cleaning photo 3" },
  { src: "/gallery/clean5.png", alt: "Cleaning photo 4" },
  { src: "/gallery/dirty2.png", alt: "Cleaning photo 5" },
  { src: "/gallery/stove1.png", alt: "Cleaning photo 6" },
  { src: "/gallery/stove2.png", alt: "Cleaning photo 7" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PhotoCarousel() {
  //loop + centered alignment
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    //onSelect(); //fix?
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const slides = useMemo(() => IMAGES, []);

  if (slides.length === 0) return null;

  return (
    <section className="mt-12">
      {/* keep it aligned with the rest of the stuff on screen */}
      <div className="mx-auto max-w-5xl px-6">
        {/* containment box to prevent horizontal scroll */}
        <div className="overflow-hidden rounded-2xl">
          <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container">
                {slides.map((img, i) => {
                  const isSelected = i === selected;

                  return (
                    <button
                      key={`${img.src}-${i}`}
                      type="button"
                      onClick={() => scrollTo(i)}
                      className={cx("embla__slide", isSelected && "is-selected")}
                      aria-label={isSelected ? "Selected photo" : "Select photo"}
                    >
                      <div className="embla__slide__inner">
                        <div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/10 sm:h-[230px]">
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 33vw"
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}