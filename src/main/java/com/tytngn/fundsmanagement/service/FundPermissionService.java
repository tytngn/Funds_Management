package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.dto.request.FundPermissionRequest;
import com.tytngn.fundsmanagement.dto.response.FundPermissionResponse;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.entity.Fund;
import com.tytngn.fundsmanagement.entity.FundPermission;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FundPermissionMapper;
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.FundPermissionRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FundPermissionService {

    FundPermissionRepository fundPermissionRepository;
    FundRepository fundRepository;
    UserRepository userRepository;
    FundPermissionMapper fundPermissionMapper;

    // cấp quyền cho danh sách người dùng
    @Transactional
    public List<FundPermissionResponse> grantPermissionsToUsers(FundPermissionRequest request) {

        Fund fund = fundRepository.findById(request.getFundId()).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        List<FundPermissionResponse> responseList = new ArrayList<>();

        // Duyệt qua danh sách từng user
        for (String userId : request.getUserId()) {
            User user = userRepository.findById(userId).orElseThrow(() ->
                    new AppException(ErrorCode.USER_NOT_EXISTS));

            // Kiểm tra xem quyền đã tồn tại chưa
            FundPermission existingPermission = fundPermissionRepository.findByUserIdAndFundId(userId, request.getFundId());

            if (existingPermission != null) {
                throw new AppException(ErrorCode.FUND_PERMISSION_EXISTS);
            }

            // Tạo quyền mới cho user
            FundPermission fundPermission = fundPermissionMapper.toFundPermission(request);
            fundPermission.setUser(user);
            fundPermission.setFund(fund);
            fundPermission.setGrantedDate(LocalDate.now());
            fundPermissionRepository.save(fundPermission);

            // Chuyển đổi sang FundPermissionResponse và thêm vào danh sách
            FundPermissionResponse response = fundPermissionMapper.toResponse(fundPermission);
            responseList.add(response);
        }
        return responseList;
    }

    // Lấy danh sách người dùng đã được cấp quyền giao dịch
    public List<FundPermissionResponse> getUsersWithPermissions(String fundId) {
        // Kiểm tra xem quỹ có tồn tại không
        Fund fund = fundRepository.findById(fundId).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        // Lấy danh sách quyền cho quỹ
        List<FundPermission> fundPermissions = fundPermissionRepository.findByFundId(fundId);

        return fundPermissions.stream()
                .map(fpermission -> fundPermissionMapper.toResponse(fpermission))
                .sorted(Comparator.comparing(FundPermissionResponse::getGrantedDate).reversed())
                .collect(Collectors.toList());
    }

    // Lấy thông tin phân quyền của người dùng trong quỹ
    public FundPermissionResponse getUserPermissionInFund(String id) {
        // Kiểm tra xem phân quyền của người dùng trong quỹ có tồn tại không
        FundPermission fundPermission = fundPermissionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_PERMISSION_NOT_EXISTS));

        // Chuyển đổi FundPermission thành FundPermissionResponse
        return fundPermissionMapper.toResponse(fundPermission);
    }

    // Lấy danh sách phân quyền giao dịch theo quỹ, theo bộ lọc (theo thời gian, theo trạng thái, theo phòng ban, theo cá nhân)
    public List<FundPermissionResponse> filterFundPermissions(String fundId, LocalDate start, LocalDate end,
                                                              Boolean canContribute, Boolean canWithdraw,
                                                              String departmentId, String userId)
    {
        List<FundPermission> fundPermissions = fundPermissionRepository.filterFundPermissions(fundId, start, end,
                canContribute, canWithdraw, departmentId, userId);

        // Chuyển đổi danh sách FundPermission thành FundPermissionResponse
        return fundPermissions.stream()
                .map(fundPermissionMapper::toResponse)
                .sorted(Comparator.comparing(FundPermissionResponse::getGrantedDate).reversed())
                .collect(Collectors.toList());
    }

    // Cập nhật quyền giao dịch của một người dùng
    @Transactional
    public FundPermissionResponse updateFundPermissions(String userId, String fundId, boolean canContribute, boolean canWithdraw) {
        // Kiểm tra xem người dùng có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        // Kiểm tra xem quỹ có tồn tại không
        Fund fund = fundRepository.findById(fundId).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        // Lấy quyền của người dùng trên quỹ
        FundPermission existingPermission = fundPermissionRepository.findByUserIdAndFundId(userId, fundId);
        if (existingPermission == null) {
            throw new AppException(ErrorCode.FUND_PERMISSION_NOT_EXISTS);
        }

        // Cập nhật quyền cho phép đóng góp và rút quỹ
        existingPermission.setCanContribute(canContribute);
        existingPermission.setCanWithdraw(canWithdraw);
        existingPermission.setGrantedDate(LocalDate.now());

        return fundPermissionMapper.toResponse(fundPermissionRepository.save(existingPermission));
    }

    // Thu hồi tất cả phân quyền giao dịch của người dùng khỏi quỹ
    @Transactional
    public void revokeFundPermissions(String id) {
        // Kiểm tra xem người dùng có phân quyền trong quỹ không
        FundPermission fundPermission = fundPermissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FUND_PERMISSION_NOT_EXISTS));

        // Xóa tất cả phân quyền của người dùng trong quỹ
        fundPermissionRepository.deleteFundPermissionById(id);
    }

}
