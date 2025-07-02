package com.eventsphere.mapper;

import com.eventsphere.dto.ApiResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResponseMapper {

    public <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    public <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.success(message, data);
    }

    public ApiResponse<Void> success(String message) {
        return ApiResponse.success(message, null);
    }

    public <T> ApiResponse<T> error(String message) {
        return ApiResponse.error(message);
    }

    public <T> ApiResponse<T> error(String message, T data) {
        return ApiResponse.error(message, data);
    }

    public <T> ApiResponse<List<T>> emptyList() {
        return ApiResponse.success("Lista vazia", List.of());
    }

    public <T> ApiResponse<List<T>> listSuccess(List<T> list) {
        if (list == null || list.isEmpty()) {
            return emptyList();
        }
        return ApiResponse.success(list);
    }

    public <T> ApiResponse<List<T>> listSuccess(String message, List<T> list) {
        return ApiResponse.success(message, list);
    }

    public <T> ApiResponse<T> created(T entity) {
        return ApiResponse.success("Criado com sucesso", entity);
    }

    public <T> ApiResponse<T> updated(T entity) {
        return ApiResponse.success("Atualizado com sucesso", entity);
    }

    public ApiResponse<Void> deleted() {
        return ApiResponse.success("Excluído com sucesso", null);
    }

    public <T> ApiResponse<T> notFound(String entityName) {
        return ApiResponse.error(entityName + " não encontrado(a)");
    }

    public <T> ApiResponse<T> unauthorized() {
        return ApiResponse.error("Operação não autorizada");
    }

    public <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.error("Dados inválidos: " + message);
    }

    public <T> ApiResponse<T> internalError() {
        return ApiResponse.error("Erro interno do servidor");
    }

    public <T> ApiResponse<T> internalError(String message) {
        return ApiResponse.error("Erro interno: " + message);
    }
}
