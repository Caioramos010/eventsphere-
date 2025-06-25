package com.eventsphere.repository;

import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantRepository extends JpaRepository<EventParticipant, Long> {

    EventParticipant findByEventIdAndUserId(Long eventId, Long userId);
    EventParticipant findAllByEventId(Long eventID);

    @Query("SELECT p.currentStatus, COUNT(p) FROM EventParticipant p WHERE p.event.id = :eventId GROUP BY p.currentStatus")
    List<Object[]> countCurrentStatus(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(h) FROM ParticipantHistory h WHERE h.participant.event.id = :eventId AND h.status = 'CONFIRMED'")
    Long countConfirmed(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(h) FROM ParticipantHistory h WHERE h.participant.event.id = :eventId AND h.status = 'PRESENT'")
    Long countPresent(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(h) FROM ParticipantHistory h WHERE h.participant.event.id = :eventId AND h.status = 'INVITED'")
    Long countInvited(@Param("eventId") Long eventId);    @Query("SELECT p FROM ParticipantHistory h JOIN h.participant p " + "WHERE p.event.id = :eventId AND h.status = :status")
    List<EventParticipant> findParticipantsByStatusInHistory(@Param("eventId") Long eventId, @Param("status") ParticipantStatus status);

    @Query("SELECT p FROM EventParticipant p WHERE p.event.id = :eventId AND p.currentStatus = :status")
    List<EventParticipant> findByEventIdAndCurrentStatus(@Param("eventId") Long eventId, @Param("status") ParticipantStatus status);

    @Query("SELECT p FROM EventParticipant p WHERE p.event.id = :eventId")
    List<EventParticipant> findAllByEventIdList(@Param("eventId") Long eventId);



}
