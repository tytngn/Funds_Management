package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.ApiResponse;
import com.tytngn.fundsmanagement.dto.request.FunctionsRequest;
import com.tytngn.fundsmanagement.dto.response.FunctionsResponse;
import com.tytngn.fundsmanagement.service.FunctionsService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/functions")
public class FunctionsController {
    FunctionsService functionsService;

    @PostMapping
    ApiResponse<FunctionsResponse> createFunctions(@RequestBody @Valid FunctionsRequest request) {
        return ApiResponse.<FunctionsResponse>builder()
                .result(functionsService.createFunction(request))
                .code(1000)
                .build();
    }

    @GetMapping
    ApiResponse<List<FunctionsResponse>> getAllFunctions() {
        return ApiResponse.<List<FunctionsResponse>>builder()
                .result(functionsService.getAllFunctions())
                .code(1000)
                .build();
    }

    @DeleteMapping("/{functionsId}")
    ApiResponse<Void> deleteFunctions(@PathVariable String functionsId) {
        functionsService.deleteFunction(functionsId);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
