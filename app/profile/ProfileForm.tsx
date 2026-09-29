"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
                                        userId,
                                        firstName,
                                        lastName,
                                        avatarUrl,
                                    }: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}) {
    const router = useRouter();
    const [first, setFirst] = useState(firstName);
    const [last, setLast] = useState(lastName);
    const [file, setFile] = useState<File | null>(null);
    const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!first.trim() || !last.trim()) {
            setMessage("Please fill in both first and last name.");
            return;
        }

        setSaving(true);
        setMessage("");
        const supabase = createClient();
        let newAvatarUrl = currentAvatar;

        if (file) {
            const path = `${userId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file);

            if (uploadError) {
                setMessage("Upload failed: " + uploadError.message);
                setSaving(false);
                return;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            newAvatarUrl = data.publicUrl;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: first.trim(),
                last_name: last.trim(),
                avatar_url: newAvatarUrl,
            })
            .eq("id", userId);

        setSaving(false);

        if (error) {
            setMessage("Save failed: " + error.message);
            return;
        }

        setCurrentAvatar(newAvatarUrl);
        setFile(null);
        setMessage("Saved!");
        router.refresh();
        router.push("/");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentAvatar && (
                <img
                    src={currentAvatar}
                    alt="Profile photo"
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            )}

            <label>
                First name
                <input
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    style={{ display: "block", width: "100%" }}
                />
            </label>

            <label>
                Last name
                <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    style={{ display: "block", width: "100%" }}
                />
            </label>

            <label>
                Photo
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    style={{ display: "block" }}
                />
            </label>

            <button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
            </button>

            {message && <p>{message}</p>}
        </div>
    );
}