import { message } from "antd";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; redirectTo?: string } };

export async function handleApiResponse<T>(
  response: Response,
  options?: {
    showSuccessMessage?: boolean;
    successMessage?: string;
    showErrorMessage?: boolean;
  }
): Promise<T> {
  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    // Handle auth errors
    if ((json as any).error?.code === "UNAUTHORIZED" || (json as any).error?.code === "FORBIDDEN") {
      const error = (json as any).error;
      if (error.redirectTo) {
        window.location.href = error.redirectTo;
      } else {
        window.location.href = "/unauthorized";
      }
      throw new Error(error.message);
    }

    // Show error message for other errors
    if (options?.showErrorMessage !== false) {
      message.error((json as any).error?.message || "Request failed");
    }
    throw new Error((json as any).error?.message);
  }

  // Show success message if requested
  if (options?.showSuccessMessage && options.successMessage) {
    message.success(options.successMessage);
  }

  return json.data;
}

export function createApiCall<T>(
  url: string,
  options?: RequestInit & {
    showSuccessMessage?: boolean;
    successMessage?: string;
    showErrorMessage?: boolean;
  }
) {
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  }).then(response => handleApiResponse<T>(response, options));
}
