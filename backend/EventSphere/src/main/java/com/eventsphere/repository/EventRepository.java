package com.eventsphere.repository;

import com.eventsphere.entity.event.Acess;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface EventRepository extends JpaRepository<Event, Long> {
    Event findByName(String name);    Event findByDescription(String description);

    Optional<Event> findByInviteToken(String inviteToken);    
    Event findByInviteCode(String inviteCode);

    @Query("SELECT e.inviteCode FROM Event e WHERE e.inviteCode IS NOT NULL")
    Set<String> findAllInviteCodes();

    @Query("SELECT e FROM Event e " +
            "JOIN e.participants p " +
            "WHERE p.user.id = :userID AND e.state IN ('CREATED', 'ACTIVE') " +
            "ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllMyEvents(@Param("userID") Long userID);

    @Query("SELECT e FROM Event e WHERE e.acess = 'PUBLIC' AND e.state IN ('CREATED', 'ACTIVE') ORDER BY " +
            "COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllpublicEvents();

    List<Event> findByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.participants p WHERE p.user.id = :userId AND e.state != :state")
    List<Event> findByParticipantsUserIdAndStateNot(@Param("userId") Long userId, @Param("state") State state);
    
    List<Event> findByAcess(Acess acess);

    @Query("SELECT e FROM Event e WHERE e.acess = :acess AND e.state NOT IN :excludedStates ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findByAcessAndStateNotIn(@Param("acess") Acess acess, @Param("excludedStates") List<State> excludedStates);

    @Query("SELECT e FROM Event e WHERE e.owner.id = :ownerId AND e.state NOT IN :excludedStates ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findByOwnerIdAndStateNotIn(@Param("ownerId") Long ownerId, @Param("excludedStates") List<State> excludedStates);

    @Query("SELECT e FROM Event e JOIN e.participants p WHERE p.user.id = :userId")
    List<Event> findEventsByParticipantUserId(@Param("userId") Long userId);
}
