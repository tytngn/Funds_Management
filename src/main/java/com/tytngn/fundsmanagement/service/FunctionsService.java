package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.FunctionsRequest;
import com.tytngn.fundsmanagement.dto.response.FunctionsResponse;
import com.tytngn.fundsmanagement.entity.Functions;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FunctionsMapper;
import com.tytngn.fundsmanagement.repository.FunctionsRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FunctionsService {

    FunctionsRepository functionsRepository;

    FunctionsMapper functionsMapper;

    public FunctionsResponse createFunction(FunctionsRequest request) {

        Functions functions = functionsMapper.toFunctions(request);

        if (functionsRepository.existsByName(functions.getName())){
            throw new AppException(ErrorCode.FUNCTIONS_EXISTS);
        }

        functions = functionsRepository.save(functions);
        return functionsMapper.toFunctionsResponse(functions);
    }

    public List<FunctionsResponse> getAllFunctions() {

        var functions = functionsRepository.findAll()
                .stream()
                .map(function -> functionsMapper.toFunctionsResponse(function))
                .toList();

        return functions;
    }

//    public FunctionsResponse updateFunction(String id, FunctionsRequest request) {
//        Functions function = functionsRepository.findById(id).orElseThrow(() ->
//                new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));
//
//        functionsMapper.updateFunctions(function, request);
//        return functionsMapper.toFunctionsResponse(functionsRepository.save(function));
//    }

    public void deleteFunction(String functionId) {
        functionsRepository.findById(functionId).orElseThrow(() ->
                new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));

        functionsRepository.deleteById(functionId);
    }
}
