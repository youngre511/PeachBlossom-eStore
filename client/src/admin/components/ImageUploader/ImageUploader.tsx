import React, { useRef } from "react";
import { useEffect, useState } from "react";
import "./image-uploader.css";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button } from "@mui/material";

interface Props {}
// const ImageUploader: React.FC<Props> = () => {
//     const [images, setImages] = useState<any[]>([]);
//     const [preview, setPreview] = useState<string[]>([]);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     useEffect(() => {
//         if (images.length > 0) {
//             const imageUrls = images.map((image) => URL.createObjectURL(image));
//             setPreview(imageUrls);
//         }
//     }, [images]);

//     const onImageChange = (e: any) => {
//         setImages([...e.target.files]);
//     };

//     const handleChooseButtonClick = () => {
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     };

//     return (
//         <div className="image-uploader">
//             {images.length > 0 && (
//                 <React.Fragment>
//                     <img src={preview[0]} className="main-image" id="0" />
//                     <div className="thumbnail-container">
//                         <div className="thumbnails">
//                             {preview.length > 1 &&
//                                 preview.map((imageUrl, index) => {
//                                     if (index > 0) {
//                                         return (
//                                             <img
//                                                 src={imageUrl}
//                                                 className="thumbnail"
//                                                 id={String(index)}
//                                             />
//                                         );
//                                     }
//                                 })}
//                         </div>
//                     </div>
//                 </React.Fragment>
//             )}
//             {images.length === 0 && (
//                 <div className="choose-button-container">
//                     <Button
//                         onClick={handleChooseButtonClick}
//                         variant="contained"
//                         className="choose-button"
//                     >
//                         Choose Files
//                     </Button>
//                 </div>
//             )}
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="image-input"
//                 multiple
//                 accept="image/*"
//                 onChange={onImageChange}
//             />
//         </div>
//     );
// };

const ImageUploader: React.FC<Props> = (Props) => {
    const [images, setImages] = useState<any[]>([]);
    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList as never[]);
    };
    return (
        <ImageUploading
            multiple
            value={images}
            maxNumber={4}
            onChange={onChange}
        >
            {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
            }) => (
                <div className="image-uploader">
                    {imageList.length > 0 && (
                        <div className="images-preview">
                            <img
                                src={imageList[0].dataURL}
                                className="main-image"
                                id="0"
                            />
                            <div className="thumbnail-container">
                                <div className="thumbnails">
                                    {imageList.length > 1 &&
                                        imageList.map((image, index) => {
                                            if (index > 0) {
                                                return (
                                                    <img
                                                        src={image.dataURL}
                                                        className="thumbnail"
                                                        id={String(index)}
                                                    />
                                                );
                                            }
                                        })}
                                </div>
                            </div>
                        </div>
                    )}
                    {images.length === 0 && (
                        <div className="choose-button-container">
                            <Button
                                onClick={onImageUpload}
                                variant="contained"
                                className="choose-button"
                                {...dragProps}
                            >
                                Click or Drop Here
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </ImageUploading>
    );
};
export default ImageUploader;
