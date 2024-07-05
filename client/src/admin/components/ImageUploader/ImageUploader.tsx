import React, { useRef, Dispatch, SetStateAction } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useEffect, useState } from "react";
import "./image-uploader.css";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button, IconButton, Tooltip } from "@mui/material";
import { ReactComponent as CloseButton } from "../../../assets/img/close.svg";
import DeleteOutlineSharpIcon from "@mui/icons-material/DeleteOutlineSharp";

interface Props {
    setImages: Dispatch<SetStateAction<ImageListType>>;
    images: ImageListType;
}

const responsive = {
    desktop: {
        breakpoint: { max: 6000, min: 1024 },
        items: 1,
        slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
        slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1, // optional, default to 1.
    },
};

const ImageUploader: React.FC<Props> = ({ setImages, images }) => {
    const [addMode, setAddMode] = useState<boolean>(true);
    const [editMode, setEditMode] = useState<boolean>(false);

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    useEffect(() => {
        if (images.length > 0) {
            setAddMode(false);
        } else {
            setAddMode(true);
            setEditMode(false);
        }
    }, [images]);

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
                        <React.Fragment>
                            <div className="images-preview">
                                {imageList.length === 1 ? (
                                    <img
                                        src={imageList[0]["dataURL"]}
                                        className="thumbnail"
                                        alt="new product thumbnail 1"
                                    />
                                ) : (
                                    <Carousel
                                        swipeable={true}
                                        draggable={false}
                                        showDots={true}
                                        responsive={responsive}
                                        ssr={true} // means to render carousel on server-side.
                                        infinite={true}
                                        keyBoardControl={true}
                                        customTransition="transform 300ms ease-in-out"
                                        transitionDuration={500}
                                        containerClass="carousel-container"
                                        removeArrowOnDeviceType={[
                                            "tablet",
                                            "mobile",
                                        ]}
                                        dotListClass="custom-dot-list-style"
                                        itemClass="carousel-item-padding-40-px"
                                    >
                                        {imageList.map((image, index) => (
                                            <div key={`image-${index}`}>
                                                <img
                                                    src={image["dataURL"]}
                                                    className="thumbnail"
                                                    id={String(index)}
                                                    alt={`new product thumbnail ${
                                                        index + 1
                                                    }`}
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
                                    </Carousel>
                                )}
                                {editMode && images.length === 1 && (
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
                            {!editMode ? (
                                <div className="edit-buttons">
                                    <Button
                                        variant="contained"
                                        onClick={() => setAddMode(true)}
                                    >
                                        ADD IMAGES
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setEditMode(true)}
                                    >
                                        EDIT IMAGES
                                    </Button>
                                </div>
                            ) : (
                                <div className="edit-buttons">
                                    <Button
                                        variant="contained"
                                        onClick={onImageRemoveAll}
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
                                {images.length > 0 && (
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
