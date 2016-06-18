package glougloumiammiam;

import glougloumiammiam.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.users.User;
import com.google.appengine.api.oauth.OAuthRequestException;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "highscoresendpoint", namespace = @ApiNamespace(ownerDomain = "mycompany.com", ownerName = "mycompany.com", packagePath = "services"))
public class HighScoresEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listHighScores", path="listHighScores")
	public CollectionResponse<HighScores> listHighScores(@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<HighScores> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(HighScores.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<HighScores>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (HighScores obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<HighScores> builder().setItems(execute).setNextPageToken(cursorString).build();
	}
	
	/**
	 * Retourne les dix meilleurs scores
	 * @return Une List
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listTenHighScores", path="listTenHighScores")
	public List<HighScores> listTenHighScores() {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<HighScores> result = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(HighScores.class);
			query.setOrdering("score desc");
		
			query.setRange(0, 10);
			

			result = (List<HighScores>) query.execute();
			
		} finally {
			mgr.close();
		}

		return result;
//		return CollectionResponse.<HighScores> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getHighScores")
	public HighScores getHighScores(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		HighScores highscores = null;
		try {
			highscores = mgr.getObjectById(HighScores.class, id);
		} finally {
			mgr.close();
		}
		return highscores;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param highscores the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertHighScores",
			clientIds = {
					Ids.WEB_CLIENT_ID
			},
			audiences = { Ids.WEB_CLIENT_ID })
	public HighScores insertHighScores(HighScores highscores, User user) 
		throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null) {
				if (containsHighScores(highscores)) {
					throw new EntityExistsException("Object already exists");
				}
				mgr.makePersistent(highscores);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
		return highscores;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param highscores the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateHighScores", path="updateHighScores",
			clientIds = {
					Ids.WEB_CLIENT_ID
			},
			audiences = { Ids.WEB_CLIENT_ID })
	public HighScores updateHighScores(HighScores highscores, User user)
			throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null && user.getEmail().equals(Ids.ADMIN_EMAIL)) {
				mgr.makePersistent(highscores);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
		return highscores;
	}
	
	/**
	 * Met à jour le score utilisateur uniquement si il est supérieur à celui déjà stocké
	 * @param highscores objet highscores
	 * @param user
	 * @return HighScores
	 * @throws OAuthRequestException
	 * @throws IOException
	 */
	@ApiMethod(name = "updateNewHighScores", path="updateNewHighScores",
			clientIds = {
					Ids.WEB_CLIENT_ID
			},
			audiences = { Ids.WEB_CLIENT_ID })
	public HighScores updateNewHighScores(HighScores highscores, User user)
			throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null) {
				HighScores hs = containsHighScoresObject(highscores);
				if (hs == null) {
					//throw new EntityNotFoundException("Object does not exist");
					mgr.makePersistent(highscores);
				} else {
					if(highscores.getScore() > hs.getScore()) {
						mgr.makePersistent(highscores);
					}
				}
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
		return highscores;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeHighScores")
	public void removeHighScores(@Named("id") String id, User user)
		throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null && user.getEmail().equals(Ids.ADMIN_EMAIL)) {
				HighScores highscores = mgr.getObjectById(HighScores.class, id);
				mgr.deletePersistent(highscores);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
	}

	private boolean containsHighScores(HighScores highscores) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(HighScores.class, highscores.getGoogleId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}
	
	/**
	 * Test si la base contient l'objet et le renvoi sinon renvoi null
	 * @param highscores
	 * @return
	 */
	private HighScores containsHighScoresObject(HighScores highscores) {
		PersistenceManager mgr = getPersistenceManager();
//		boolean contains = true;
		HighScores hs = null;
		try {
			hs = mgr.getObjectById(HighScores.class, highscores.getGoogleId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
//			contains = false;
		} finally {
			mgr.close();
		}
		return hs;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
