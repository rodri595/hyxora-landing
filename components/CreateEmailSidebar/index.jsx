"use client";

import ErrorComp from "@/components/Error";
import Field from "@/components/Field";
import Spinner from "@/components/Spinner";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import { useSendTextEmails } from "@/hooks/admin/useSendTextEmails";
import { cn } from "@/utils";
import { isValidEmail } from "@/utils/email";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const CreateEmailSidebar = ({ onClose }) => {
  const panelRef = useRef(null);
  const { data: allUsers = [], error: usersError, isLoading: usersLoading } = useGetAllUsers();
  const { mutate: sendEmails, isPending, isSuccess, error: sendError } = useSendTextEmails();

  const [search, setSearch] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" }
      );
    },
    { scope: panelRef }
  );

  const usersWithEmail = useMemo(() => allUsers.filter((u) => u?.email), [allUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return usersWithEmail;
    const q = search.toLowerCase();
    return usersWithEmail.filter((u) => u.email.toLowerCase().includes(q));
  }, [usersWithEmail, search]);

  const addUser = useCallback((email) => {
    setSelectedEmails((prev) => (prev.includes(email) ? prev : [...prev, email]));
  }, []);

  const removeEmail = useCallback((email) => {
    setSelectedEmails((prev) => prev.filter((e) => e !== email));
  }, []);

  // A recipient doesn't have to be a registered user: whatever is typed can be
  // added straight from the search box, with Enter or the button below it.
  const typed = search.trim().toLowerCase();
  const typedIsEmail = isValidEmail(typed);
  const typedAlreadyAdded = selectedEmails.includes(typed);

  const addTyped = useCallback(() => {
    if (!typedIsEmail || typedAlreadyAdded) return;
    addUser(typed);
    setSearch("");
  }, [addUser, typed, typedIsEmail, typedAlreadyAdded]);

  const allSelected =
    usersWithEmail.length > 0 && usersWithEmail.every((u) => selectedEmails.includes(u.email));

  const addAll = useCallback(() => {
    setSelectedEmails((prev) => {
      const set = new Set(prev);
      for (const u of usersWithEmail) set.add(u.email);
      return [...set];
    });
  }, [usersWithEmail]);

  const removeAll = useCallback(() => {
    const emails = new Set(usersWithEmail.map((u) => u.email));
    setSelectedEmails((prev) => prev.filter((e) => !emails.has(e)));
  }, [usersWithEmail]);

  const canSend = selectedEmails.length > 0 && subject.trim() && content.trim();

  const handleSend = () => {
    const texts = Array(selectedEmails.length).fill(content.trim());
    sendEmails({ emails: selectedEmails, subject: subject.trim(), texts });
  };

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F]">
          {isSuccess ? "Email enviado" : "Nuevo email"}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {isSuccess ? (
        /* ── Success screen ── */
        <div className="flex flex-col flex-1 items-center justify-center gap-4 px-6 text-center">
          <div className="size-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12l5.5 5.5L20 6"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-inter font-semibold text-[13px] tracking-[-0.52px] text-[#19363F]">
              Emails enviados correctamente
            </p>
            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
              Se enviaron {selectedEmails.length} email{selectedEmails.length !== 1 ? "s" : ""} con
              el asunto «{subject}»
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 h-8 px-5 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] hover:bg-[#0f2228] transition-colors"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable form */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
            <div className="flex flex-col gap-5 p-4">
              {/* ── Recipients ── */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                    Destinatarios
                  </span>
                  <button
                    type="button"
                    onClick={allSelected ? removeAll : addAll}
                    className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[#19363F] hover:underline"
                  >
                    {allSelected ? "Quitar todos" : `Añadir todos (${usersWithEmail.length})`}
                  </button>
                </div>

                <Field
                  type="email"
                  placeholder="Buscar usuario o escribir email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    addTyped();
                  }}
                  classInput="placeholder:text-[rgba(25,54,63,0.3)]"
                />

                {typed && (typedIsEmail || filtered.length === 0) && (
                  <button
                    type="button"
                    onClick={addTyped}
                    disabled={!typedIsEmail || typedAlreadyAdded}
                    className={cn(
                      "flex items-center gap-1.5 h-7 px-2.5 rounded-lg border-[0.7px] font-inter text-[11px] tracking-[-0.44px] transition-colors",
                      typedIsEmail && !typedAlreadyAdded
                        ? "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
                        : "border-[rgba(25,54,63,0.08)] text-[rgba(25,54,63,0.35)] cursor-not-allowed"
                    )}
                  >
                    {typedAlreadyAdded ? (
                      `«${typed}» ya está añadido`
                    ) : typedIsEmail ? (
                      <>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 1v8M1 5h8"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="truncate">Añadir «{typed}»</span>
                      </>
                    ) : (
                      "Escribe un email válido para añadirlo"
                    )}
                  </button>
                )}

                <div className="flex flex-col rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] overflow-hidden max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner />
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="px-3 py-4 font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)] text-center">
                      Sin resultados
                    </p>
                  ) : (
                    filtered.map((u) => {
                      const selected = selectedEmails.includes(u.email);
                      return (
                        <button
                          key={u._id ?? u.email}
                          type="button"
                          onClick={() => (selected ? removeEmail(u.email) : addUser(u.email))}
                          className={cn(
                            "flex items-center justify-between gap-2 px-3 py-2 text-left border-b-[0.7px] border-[rgba(25,54,63,0.05)] last:border-0 transition-colors",
                            selected ? "bg-[rgba(25,54,63,0.04)]" : "hover:bg-[rgba(25,54,63,0.02)]"
                          )}
                        >
                          <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F] truncate">
                            {u.email}
                          </span>
                          <span
                            className={cn(
                              "size-3.5 shrink-0 rounded-[3px] border flex items-center justify-center transition-all",
                              selected
                                ? "bg-[#19363F] border-[#19363F]"
                                : "bg-white border-[rgba(25,54,63,0.2)]"
                            )}
                          >
                            {selected && (
                              <svg
                                width="8"
                                height="6"
                                viewBox="0 0 8 6"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M1 3l2 2 4-4"
                                  stroke="white"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-[rgba(25,54,63,0.06)] border-[0.7px] border-[rgba(25,54,63,0.1)]"
                      >
                        <span className="font-inter text-[10px] tracking-[-0.4px] text-[#19363F]">
                          {email}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          aria-label={`Quitar ${email}`}
                          className="size-3.5 flex items-center justify-center rounded-full hover:bg-[rgba(25,54,63,0.1)] transition-colors"
                        >
                          <svg
                            width="6"
                            height="6"
                            viewBox="0 0 8 8"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M6.5 1.5l-5 5M1.5 1.5l5 5"
                              stroke="rgba(25,54,63,0.5)"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ErrorComp
                error={usersError}
                message={
                  usersError?.response?.data?.message ||
                  usersError?.message ||
                  "Ocurrió un error al cargar los usuarios"
                }
              />

              <Field
                label="Asunto"
                placeholder="Escribe el asunto..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                classInput="placeholder:text-[rgba(25,54,63,0.3)]"
              />

              <Field
                label="Contenido"
                textarea
                placeholder="Escribe el mensaje..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                classInput="!h-40 placeholder:text-[rgba(25,54,63,0.3)]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0 flex flex-col gap-2">
            <button
              type="button"
              disabled={!canSend || isPending}
              onClick={handleSend}
              className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors flex items-center justify-center"
            >
              {isPending ? (
                <Spinner />
              ) : (
                `Enviar a ${selectedEmails.length || 0} destinatario${selectedEmails.length !== 1 ? "s" : ""}`
              )}
            </button>
            <ErrorComp
              error={sendError}
              message={
                sendError?.response?.data?.message ||
                sendError?.message ||
                "Ocurrió un error al enviar el email"
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CreateEmailSidebar;
