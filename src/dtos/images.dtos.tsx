export enum ImageType {
  Cover = 'cover',
  Selection = 'selection',
  Profile = 'profile',
}

export interface ImageUploadBody {
  image: File;
  type: ImageType;
}

export interface ImageResponse {
  url: string;
  fileName: string;
  key: string;
}
