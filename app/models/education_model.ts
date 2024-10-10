export interface EducationModel {
  id: number;
  title: string;
  description: string;
  content: string;
  photo: string;
  media_url: string | null;
  media_upload: string | null;
  created_at: string;
  updated_at: string;
  status_id: number;
  status: Status;
}

interface Status {
  id: number;
  value: string;
}

export interface EducationResponse {
  data: EducationModel[];
  page: number;
  page_items: number;
  max_page: number;
}
