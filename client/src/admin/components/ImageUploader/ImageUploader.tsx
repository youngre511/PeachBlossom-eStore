import React, { useRef, Dispatch, SetStateAction } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import "./image-uploader.css";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button, IconButton, Tooltip } from "@mui/material";
import { ReactComponent as CloseButton } from "../../../assets/img/close.svg";
import DeleteOutlineSharpIcon from "@mui/icons-material/DeleteOutlineSharp";

interface Props {
    setImages: Dispatch<SetStateAction<ImageListType>>;
    images: ImageListType;
    setImageUrls?: Dispatch<SetStateAction<string[]>>;
    imageUrls?: string[];
    managedEditMode?: boolean;
    productEditMode?: boolean;
}

const settings: Settings = {
    swipe: true,
    draggable: false,
    dots: true,
    infinite: true,
    speed: 500,
    cssEase: "ease-in-out",
    arrows: false,
    adaptiveHeight: true,
    className: "carousel-container",
    appendDots: (dots) => <ul className="custom-dot-list-style">{dots}</ul>,
    responsive: [
        {
            breakpoint: 6000, // Max width for desktop
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
            },
        },
        {
            breakpoint: 1024, // Max width for tablet
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 464, // Max width for mobile
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
};

const ImageUploader: React.FC<Props> = ({
    setImages,
    images,
    setImageUrls,
    imageUrls,
    managedEditMode = false,
    productEditMode,
}) => {
    const [addMode, setAddMode] = useState<boolean>(true);
    const [editMode, setEditMode] = useState<boolean>(false);

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        // data for submit
        console.log("image list:", imageList);
        setImages(imageList);
    };

    useEffect(() => {
        if (images.length > 0 || (imageUrls && imageUrls.length > 0)) {
            setAddMode(false);
        } else {
            setAddMode(true);
            setEditMode(false);
        }
    }, [images, imageUrls]);

    useEffect(() => {
        if ((imageUrls && imageUrls.length > 0) || productEditMode === false)
            setAddMode(false);
    }, []);

    const onImageUrlRemove = (index: number) => {
        if (imageUrls && setImageUrls) {
            const newImageUrls = [...imageUrls];
            newImageUrls.splice(index, 1);
            setImageUrls(newImageUrls);
        }
    };
    const onImageUrlRemoveAll = () => {
        if (setImageUrls) {
            setImageUrls([]);
        }
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
                    {(imageList.length > 0 ||
                        (imageUrls && imageUrls.length > 0)) && (
                        <React.Fragment>
                            <div className="images-preview">
                                {/* If there is only one item in the image list and none in the imageUrls or imageUrls doesn't exist  */}
                                {imageList.length === 1 &&
                                    (!imageUrls || imageUrls.length === 0) && (
                                        <div>
                                            <img
                                                src={imageList[0]["dataURL"]}
                                                className="thumbnail"
                                                alt="new product thumbnail"
                                            />
                                            {editMode && (
                                                <div className="delete-button-container">
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            className="delete-button"
                                                            sx={{
                                                                width: "100px",
                                                                height: "auto",
                                                            }}
                                                            onClick={() =>
                                                                onImageRemoveAll()
                                                            }
                                                        >
                                                            <DeleteOutlineSharpIcon
                                                                sx={{
                                                                    width: "100px",
                                                                    height: "auto",
                                                                    color: "white",
                                                                    opacity: 0.8,
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                {imageList.length === 0 &&
                                    imageUrls &&
                                    imageUrls.length === 1 && (
                                        <div>
                                            <img
                                                src={imageUrls[0]}
                                                className="thumbnail"
                                                alt="product thumbnail"
                                            />
                                            {editMode && (
                                                <div className="delete-button-container">
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            className="delete-button"
                                                            sx={{
                                                                width: "100px",
                                                                height: "auto",
                                                            }}
                                                            onClick={() =>
                                                                onImageUrlRemoveAll()
                                                            }
                                                        >
                                                            <DeleteOutlineSharpIcon
                                                                sx={{
                                                                    width: "100px",
                                                                    height: "auto",
                                                                    color: "white",
                                                                    opacity: 0.8,
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                {/* If there is more than one image total */}
                                {(imageList.length > 1 ||
                                    (imageUrls &&
                                        imageUrls.length + imageList.length >
                                            1)) && (
                                    <Slider {...settings}>
                                        {imageUrls &&
                                            imageUrls.map((imageUrl, index) => (
                                                <div key={imageUrl}>
                                                    <img
                                                        src={imageUrl}
                                                        className="thumbnail"
                                                        id={`existing-${index}`}
                                                        alt={`product thumbnail ${
                                                            index + 1
                                                        }`}
                                                    />
                                                    {editMode && (
                                                        <div className="delete-button-container imageUrl">
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    className="delete-button"
                                                                    sx={{
                                                                        width: "100px",
                                                                        height: "auto",
                                                                    }}
                                                                    onClick={() =>
                                                                        onImageUrlRemove(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <DeleteOutlineSharpIcon
                                                                        sx={{
                                                                            width: "100px",
                                                                            height: "auto",
                                                                            color: "white",
                                                                            opacity: 0.8,
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        {imageList.map((image, index) => (
                                            <div key={image["dataURL"]}>
                                                <img
                                                    src={image["dataURL"]}
                                                    className="thumbnail"
                                                    id={String(index)}
                                                    alt={`new product thumbnail ${
                                                        index + 1
                                                    }`}
                                                />
                                                {editMode && (
                                                    <div className="delete-button-container imageList">
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                className="delete-button"
                                                                sx={{
                                                                    width: "100px",
                                                                    height: "auto",
                                                                }}
                                                                onClick={() =>
                                                                    onImageRemove(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <DeleteOutlineSharpIcon
                                                                    sx={{
                                                                        width: "100px",
                                                                        height: "auto",
                                                                        color: "white",
                                                                        opacity: 0.8,
                                                                    }}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </Slider>
                                )}
                            </div>
                            {!editMode ? (
                                <div className="edit-buttons">
                                    <Button
                                        variant="contained"
                                        onClick={() => setAddMode(true)}
                                        disabled={
                                            managedEditMode
                                                ? !productEditMode
                                                : false
                                        }
                                    >
                                        ADD IMAGES
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setEditMode(true)}
                                        disabled={
                                            managedEditMode
                                                ? !productEditMode
                                                : false
                                        }
                                    >
                                        EDIT IMAGES
                                    </Button>
                                </div>
                            ) : (
                                <div className="edit-buttons">
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            onImageRemoveAll();
                                            onImageUrlRemoveAll();
                                        }}
                                    >
                                        DELETE ALL IMAGES
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setEditMode(false)}
                                    >
                                        CANCEL
                                    </Button>
                                </div>
                            )}
                        </React.Fragment>
                    )}

                    {addMode && (
                        <div
                            className="choose-button-container"
                            style={
                                isDragging
                                    ? {
                                          backgroundColor:
                                              "rgba(255, 255, 255, 0.8)",
                                      }
                                    : {
                                          backgroundColor:
                                              "rgba(255, 255, 255, 0.422)",
                                      }
                            }
                            {...dragProps}
                        >
                            <div className="cancel-button">
                                <div></div>
                                {(images.length > 0 ||
                                    (imageUrls && imageUrls.length > 0)) && (
                                    <CloseButton
                                        onClick={() => setAddMode(false)}
                                    />
                                )}
                            </div>
                            <Button
                                onClick={onImageUpload}
                                variant="contained"
                                className="choose-button"
                                {...dragProps}
                            >
                                Click or Drop Here
                            </Button>
                            <div style={{ height: "30px" }}></div>
                        </div>
                    )}
                </div>
            )}
        </ImageUploading>
    );
};
export default ImageUploader;
