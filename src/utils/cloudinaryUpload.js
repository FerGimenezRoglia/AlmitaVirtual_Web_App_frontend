
export async function uploadFileToCloudinary(file) {
    const cloudName = "dwk4mvgtp";
    const uploadPreset = "almita_files_unsigned";
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "almita_cloud/user_uploads"); // 🟢 carpeta en Cloudinary
  
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.secure_url; // 🌐 Este es el link que se guarda en el backend
      } else {
        throw new Error("Error al subir el archivo a Cloudinary");
      }
    } catch (error) {
      console.error("❌ Error en Cloudinary:", error);
      return null;
    }
  }
  