import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // ajusta ruta si es distinta

// ...
const [enrollInfo, setEnrollInfo] = useState({
  enrolled: false,
  photoUrl: null,
  enrolledAt: null,
});

useEffect(() => {
  const run = async () => {
    if (!rut) return;

    const cleanRut = rut.replaceAll(".", "").trim().toUpperCase();

    const { data, error } = await supabase
      .from("face_enrollments")
      .select("rut, photo_url, created_at, updated_at")
      .eq("rut", cleanRut)
      .maybeSingle();

    if (error) {
      console.error("Error consultando face_enrollments:", error);
      setEnrollInfo({ enrolled: false, photoUrl: null, enrolledAt: null });
      return;
    }

    setEnrollInfo({
      enrolled: !!data,
      photoUrl: data?.photo_url ?? null,
      enrolledAt: (data?.updated_at ?? data?.created_at) ?? null,
    });
  };

  run();
}, [rut]);
